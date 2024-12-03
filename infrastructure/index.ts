import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

// Create a new VPC with public and private subnets across multiple AZs
const vpc = new awsx.ec2.Vpc("my-vpc", {
  numberOfAvailabilityZones: 2, // Specify 2 AZs for the backend
  subnetSpecs: [
    { type: "Public", name: "public-subnet-1" }, // Public subnet in AZ 1
    { type: "Private", name: "private-subnet-1" }, // Private subnet in AZ 1
    { type: "Public", name: "public-subnet-2" }, // Public subnet in AZ 2
    { type: "Private", name: "private-subnet-2" }, // Private subnet in AZ 2
  ],
  subnetStrategy: "Auto", // Auto subnet strategy for public/private subnets
});

// Ensure public subnets are spread across different AZs
const publicSubnets = vpc.publicSubnetIds; // Public subnets in both AZs
const privateSubnets = vpc.privateSubnetIds; // Private subnets in both AZs

// Create Elastic IP for the NAT Gateway (for private subnet internet access)
const natEip = new aws.ec2.Eip("nat-eip", {
  vpc: true,
});

// Create the NAT Gateway in the first public subnet
const natGateway = new aws.ec2.NatGateway("nat-gateway", {
  allocationId: natEip.id,
  subnetId: publicSubnets[0], // NAT Gateway in the first public subnet
});

// Create private route table and associate it automatically with private subnets
const privateRouteTable = new aws.ec2.RouteTable("private-route-table", {
  vpcId: vpc.vpcId,
  routes: [
    {
      cidrBlock: "0.0.0.0/0", // Route to the internet through the NAT Gateway
      natGatewayId: natGateway.id,
    },
  ],
});

// Automatically associate private subnets with the private route table
vpc.privateSubnetIds.apply((subnets: string[]) =>
  subnets.map(
    (subnetId: string) =>
      new aws.ec2.RouteTableAssociation("private-subnet-association", {
        subnetId: subnetId,
        routeTableId: privateRouteTable.id,
      })
  )
);

// ** Create the Internet Gateway for Public Subnets **
const internetGateway = new aws.ec2.InternetGateway("internet-gateway", {
  vpcId: vpc.vpcId, // Attach the IGW to the VPC
});

// ** Create the Public Route Table and associate it with public subnets **
const publicRouteTable = new aws.ec2.RouteTable("public-route-table", {
  vpcId: vpc.vpcId,
  routes: [
    {
      cidrBlock: "0.0.0.0/0", // Route to the internet through the Internet Gateway
      gatewayId: internetGateway.id,
    },
  ],
});

// Automatically associate public subnets with the public route table
vpc.publicSubnetIds.apply((subnets: string[]) =>
  subnets.map(
    (subnetId: string) =>
      new aws.ec2.RouteTableAssociation("public-subnet-association", {
        subnetId: subnetId,
        routeTableId: publicRouteTable.id,
      })
  )
);

// Create security groups for frontend and backend
const frontendSg = new aws.ec2.SecurityGroup("frontend-sg", {
  vpcId: vpc.vpcId,
  ingress: [
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
  ],
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

const backendSg = new aws.ec2.SecurityGroup("backend-sg", {
  vpcId: vpc.vpcId,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      securityGroups: [frontendSg.id],
    },
  ],
  egress: [
    { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
  ],
});

// Launch a single EC2 instance for the frontend
const frontendInstance = new aws.ec2.Instance("frontend-instance", {
  ami: "ami-0f935a2ecd3a7bd5c", // Replace with the appropriate AMI for your region
  instanceType: "t2.micro", // Adjust instance type as needed
  subnetId: publicSubnets[0], // Deploy in the first public subnet
  vpcSecurityGroupIds: [frontendSg.id],
  keyName: "simplyDoneKey", // Replace with your SSH key pair
  userData: `#!/bin/bash
        yum update -y
        yum install -y docker
        service docker start
        usermod -aG docker ec2-user
        docker pull bayajid23/simply-done-client:latest
        docker run -d -p 5173:80 bayajid23/simply-done-client:latest`,
  tags: {
    Name: "FrontendInstance",
  },
});

// Create Load Balancer in public subnets across multiple AZs for backend
const alb = new aws.lb.LoadBalancer("my-alb", {
  subnets: [publicSubnets[0], publicSubnets[1]], // Place ALB in both public subnets
  securityGroups: [frontendSg.id], // Associate security group with ALB
  enableDeletionProtection: false, // Optional, set to false for testing
  loadBalancerType: "application", // Use ALB (Application Load Balancer)
  internal: false, // Internet-facing ALB
});

// Create Target Group for backend instances
const backendTargetGroup = new aws.lb.TargetGroup("backend-tg", {
  port: 80,
  protocol: "HTTP",
  vpcId: vpc.vpcId,
});

// Create listener for the ALB to forward traffic to backend instances
const listener = new aws.lb.Listener("listener", {
  loadBalancerArn: alb.arn,
  port: 80,
  defaultActions: [{ type: "forward", targetGroupArn: backendTargetGroup.arn }],
});

// Create Launch Template for backend instances (use for autoscaling)
const launchTemplate = new aws.ec2.LaunchTemplate("backend-launch-template", {
  imageId: "ami-0f935a2ecd3a7bd5c", // Replace with appropriate AMI
  instanceType: "t2.micro", // Adjust instance type as needed
  keyName: "simplyDoneKey", // Replace with your key pair name
  networkInterfaces: [
    {
      associatePublicIpAddress: "false", // Backend instances are private
      securityGroups: [backendSg.id],
    },
  ],
});

// Create Auto Scaling Group for backend instances across multiple AZs
const asg = new aws.autoscaling.Group("backend-asg", {
  desiredCapacity: 2, // Start with 2 instances
  maxSize: 5,
  minSize: 1,
  vpcZoneIdentifiers: privateSubnets, // Use private subnets in multiple AZs
  launchTemplate: {
    id: launchTemplate.id,
    version: "$Latest",
  },
  targetGroupArns: [backendTargetGroup.arn], // Attach autoscaled instances to the backend target group
});

// Export outputs
export const frontendPublicIp = frontendInstance.publicIp;
export const albDnsName = alb.dnsName;

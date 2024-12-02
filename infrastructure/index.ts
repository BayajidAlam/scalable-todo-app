import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

// Create a new VPC with public and private subnets
const vpc = new awsx.ec2.Vpc("my-vpc", {
    numberOfAvailabilityZones: 2,
    subnetSpecs: [
        { type: "Public", name: "public-subnet" },
        { type: "Private", name: "private-subnet" },
    ],
});

// Create Elastic IP for the NAT Gateway
const natEip = new aws.ec2.Eip("nat-eip", {
    vpc: true,
});

// Create the NAT Gateway in the public subnet
const natGateway = new aws.ec2.NatGateway("nat-gateway", {
    allocationId: natEip.id,
    subnetId: vpc.publicSubnetIds[0], // Place the NAT Gateway in the public subnet
});

// Create public route table and associate it with the public subnet
const publicRouteTable = new aws.ec2.RouteTable("public-route-table", {
    vpcId: vpc.vpcId,
    routes: [
        {
            cidrBlock: "0.0.0.0/0", // Route to the internet
            gatewayId: vpc.internetGateway.id, // Use the IGW created by awsx
        },
    ],
});

// Associate the public route table with the public subnet
new aws.ec2.RouteTableAssociation("public-subnet-association", {
    subnetId: vpc.publicSubnetIds[0],
    routeTableId: publicRouteTable.id,
});

// Create private route table and route traffic through NAT Gateway
const privateRouteTable = new aws.ec2.RouteTable("private-route-table", {
    vpcId: vpc.vpcId,
    routes: [
        {
            cidrBlock: "0.0.0.0/0", // Route to the internet through the NAT Gateway
            natGatewayId: natGateway.id,
        },
    ],
});

// Associate the private route table with the private subnet
new aws.ec2.RouteTableAssociation("private-subnet-association", {
    subnetId: vpc.privateSubnetIds[0],
    routeTableId: privateRouteTable.id,
});

// Create security groups for frontend and backend
const frontendSg = new aws.ec2.SecurityGroup("frontend-sg", {
    vpcId: vpc.vpcId,
    ingress: [
        {
            protocol: "tcp",
            fromPort: 22, // Allow SSH access
            toPort: 22,
            cidrBlocks: ["0.0.0.0/0"], 
        },
        {
            protocol: "tcp",
            fromPort: 80,
            toPort: 80,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    egress: [
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
});

const backendSg = new aws.ec2.SecurityGroup("backend-sg", {
    vpcId: vpc.vpcId,
    ingress: [
        {
            protocol: "tcp",
            fromPort: 22, // Allow SSH access for backend instances
            toPort: 22,
            cidrBlocks: ["0.0.0.0/0"], 
        },
        {
            protocol: "tcp",
            fromPort: 80,
            toPort: 80,
            securityGroups: [frontendSg.id], // Allow traffic from frontend
        },
    ],
    egress: [
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
});

// Launch EC2 instance for the frontend
const frontendInstance = new aws.ec2.Instance("frontend-instance", {
    ami: "ami-03b6c12f592f54cf3", // Replace with a valid AMI ID
    instanceType: "t2.micro",
    subnetId: vpc.publicSubnetIds[0],
    vpcSecurityGroupIds: [frontendSg.id],
    keyName: "your-key-pair-name", // Specify your key pair name here
    userData: `#!/bin/bash
                # Install Docker
                yum update -y
                yum install -y docker
                service docker start
                usermod -aG docker ec2-user

                # Pull and run the frontend Docker image
                docker pull bayajid23/simply-done-client:latest
                docker run -d -p 5173:80 bayajid23/simply-done-client:latest`,
});

// Set up Application Load Balancer (ALB)
const alb = new aws.lb.LoadBalancer("my-alb", {
    subnets: vpc.publicSubnetIds, // Use public subnets
    securityGroups: [frontendSg.id], // Associate security group with the ALB
});

// Create a listener for the ALB on port 80
const listener = new aws.lb.Listener("listener", {
    loadBalancerArn: alb.arn,
    port: 80,
    defaultActions: [
        {
            type: "fixed-response",
            fixedResponse: {
                statusCode: "200",
                contentType: "text/plain",
                messageBody: "Hello World!",
            },
        },
    ],
});

// Create a Target Group for the backend
const backendTargetGroup = new aws.lb.TargetGroup("backend-tg", {
    port: 80,
    protocol: "HTTP",
    vpcId: vpc.vpcId,
});

// Set up Auto Scaling Group for backend instances across multiple AZs using Launch Configuration
const launchConfiguration = new aws.ec2.LaunchConfiguration("backend-launch-config", {
    imageId: "ami-03b6c12f592f54cf3", // Replace with a valid AMI ID
    instanceType: "t2.micro",
    securityGroups: [backendSg.id],
    keyName: "your-key-pair-name", // Specify your key pair name here as well
});

const asg = new aws.autoscaling.Group("backend-asg", {
    desiredCapacity: 2,
    maxSize: 3,
    minSize: 1,
    vpcZoneIdentifiers: vpc.privateSubnetIds, // Use private subnets across multiple AZs
    launchConfiguration, // Correctly reference launch configuration here (no suffix)
});

// Export outputs for easy access
export const frontendPublicIp = frontendInstance.publicIp;
export const albDnsName = alb.dnsName;
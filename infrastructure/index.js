import * as aws from "@pulumi/aws";

// Create a new VPC
const vpc = new aws.ec2.Vpc("todo-app-vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: "todo-app-vpc",
  },
});

// Public Subnets in two availability zones
const publicSubnet1 = new aws.ec2.Subnet("public-subnet-1", {
  vpcId: vpc.id,
  cidrBlock: "10.0.1.0/24",
  availabilityZone: "ap-southeast-1a", 
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "public-subnet-1",
    Tier: "Public",
  },
});


const publicSubnet2 = new aws.ec2.Subnet("public-subnet-2", {
  vpcId: vpc.id,
  cidrBlock: "10.0.2.0/24",
  availabilityZone: "ap-southeast-1b",
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "public-subnet-2",
    Tier: "Public",
  },
});

// Private Subnets in two availability zones
const privateSubnet1 = new aws.ec2.Subnet("private-subnet-1", {
  vpcId: vpc.id,
  cidrBlock: "10.0.3.0/24",
  availabilityZone: "ap-southeast-1a",
  tags: {
    Name: "private-subnet-1",
    Tier: "Private",
  },
});

const privateSubnet2 = new aws.ec2.Subnet("private-subnet-2", {
  vpcId: vpc.id,
  cidrBlock: "10.0.4.0/24",
  availabilityZone: "ap-southeast-1b",
  tags: {
    Name: "private-subnet-2",
    Tier: "Private",
  },
});

// Internet Gateway for internet access
const internetGateway = new aws.ec2.InternetGateway("todo-igw", {
  vpcId: vpc.id,
  tags: {
    Name: "todo-app-igw",
  },
});

// Elastic IPs for NAT Gateways
const eip1 = new aws.ec2.Eip("eip-1", {
  domain: "vpc",
  tags: { Name: "todo-app-eip-1" },
});

const eip2 = new aws.ec2.Eip("eip-2", {
  domain: "vpc",
  tags: { Name: "todo-app-eip-2" },
});

// NAT Gateways for private instances to access the internet
const natGateway1 = new aws.ec2.NatGateway("nat-gw-1", {
  subnetId: publicSubnet1.id,
  allocationId: eip1.id,
  tags: {
    Name: "todo-app-nat-gw-1",
  },
});

const natGateway2 = new aws.ec2.NatGateway("nat-gw-2", {
  subnetId: publicSubnet2.id,
  allocationId: eip2.id,
  tags: {
    Name: "todo-app-nat-gw-2",
  },
});

// Public Route Table for public subnets
const publicRouteTable = new aws.ec2.RouteTable("public-route-table", {
  vpcId: vpc.id,
  tags: {
    Name: "todo-app-public-rt",
  },
});

// Route to Internet Gateway for public route table
const publicRoute = new aws.ec2.Route("public-igw-route", {
  routeTableId: publicRouteTable.id,
  destinationCidrBlock: "0.0.0.0/0",
  gatewayId: internetGateway.id,
});

// Associate public subnets with public route table
new aws.ec2.RouteTableAssociation("public-subnet-1-rt-assoc", {
  subnetId: publicSubnet1.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation("public-subnet-2-rt-assoc", {
  subnetId: publicSubnet2.id,
  routeTableId: publicRouteTable.id,
});

// Private Route Tables for private subnets
const privateRouteTable1 = new aws.ec2.RouteTable("private-route-table-1", {
  vpcId: vpc.id,
  tags: {
    Name: "todo-app-private-rt-1",
  },
});

const privateRouteTable2 = new aws.ec2.RouteTable("private-route-table-2", {
  vpcId: vpc.id,
  tags: {
    Name: "todo-app-private-rt-2",
  },
});

// Routes to NAT Gateways for private route tables
new aws.ec2.Route("private-nat-route-1", {
  routeTableId: privateRouteTable1.id,
  destinationCidrBlock: "0.0.0.0/0",
  natGatewayId: natGateway1.id,
});

new aws.ec2.Route("private-nat-route-2", {
  routeTableId: privateRouteTable2.id,
  destinationCidrBlock: "0.0.0.0/0",
  natGatewayId: natGateway2.id,
});

// Associate private subnets with private route tables
new aws.ec2.RouteTableAssociation("private-subnet-1-rt-assoc", {
  subnetId: privateSubnet1.id,
  routeTableId: privateRouteTable1.id,
});

new aws.ec2.RouteTableAssociation("private-subnet-2-rt-assoc", {
  subnetId: privateSubnet2.id,
  routeTableId: privateRouteTable2.id,
});

// Security Group for Load Balancer (Backend Instance)
const albSecurityGroup = new aws.ec2.SecurityGroup("alb-sg", {
  vpcId: vpc.id,
  description: "Allow HTTP, HTTPS, and SSH",
  ingress: [
    { fromPort: 80, toPort: 80, protocol: "tcp", cidrBlocks: ["0.0.0.0/0"] },
    { fromPort: 443, toPort: 443, protocol: "tcp", cidrBlocks: ["0.0.0.0/0"] }, 
    { fromPort: 22, toPort: 22, protocol: "tcp", cidrBlocks: ["0.0.0.0/0"] }, 
  ],
  egress: [
    { fromPort: 0, toPort: 0, protocol: "-1", cidrBlocks: ["0.0.0.0/0"] },
  ],
});

const albSecurityGroupId = albSecurityGroup.id;

// Application Load Balancer (Public Facing)
const alb = new aws.lb.LoadBalancer("todo-app-alb", {
  internal: false,
  loadBalancerType: "application",
  securityGroups: [albSecurityGroup.id],
  subnets: [publicSubnet1.id, publicSubnet2.id],
  tags: {
    Name: "todo-app-alb",
  },
});

// ALB Target Group for Backend
const backendTargetGroup = new aws.lb.TargetGroup("backend-target-group", {
  port: 5000,
  protocol: "HTTP",
  vpcId: vpc.id,
  healthCheck: {
    enabled: true,
    path: "/",
    healthyThreshold: 3,
    unhealthyThreshold: 2,
    timeout: 5,
    interval: 30,
    matcher: "200-399",
  },
  tags: {
    Name: "backend-target-group",
  },
});

// ALB Listener for Backend
new aws.lb.Listener("backend-listener", {
  loadBalancerArn: alb.arn,
  port: 5000,
  defaultActions: [
    {
      type: "forward",
      targetGroupArn: backendTargetGroup.arn,
    },
  ],
});

// Launch Template for Frontend instance (no scaling or load balancing)
const frontendLaunchTemplate = new aws.ec2.LaunchTemplate(
  "frontend-launch-template",
  {
    imageId: "ami-00cc19526c19193b9",
    instanceType: "t2.micro",
    keyName: "MyKeyPair",
    securityGroupIds: [albSecurityGroup.id],
    tags: { Name: "frontend-instance" },
  }
);

// EC2 Instance for Frontend (no scaling or load balancing)
const frontendInstance = new aws.ec2.Instance("frontend-instance", {
  ami: frontendLaunchTemplate.imageId,
  instanceType: "t2.micro",
  keyName: "MyKeyPair", // Ensure this matches your downloaded key pair
  subnetId: publicSubnet1.id,
  associatePublicIpAddress: true, // This should be true for direct access
  securityGroupIds: [albSecurityGroup.id],
  tags: {
    Name: "frontend-instance",
  },
});

// Launch Template for Backend instances (with scaling and load balancing)
const backendLaunchTemplate = new aws.ec2.LaunchTemplate("backend-launch-template", {
  imageId: "ami-00cc19526c19193b9",
  instanceType: "t2.micro",
  keyName: "MyKeyPair",
  securityGroupIds: [albSecurityGroup.id],
  networkInterfaces: [
    {
      associatePublicIpAddress: false, // Ensure this is false
      securityGroups: [albSecurityGroup.id],
      subnetId: privateSubnet1.id,
    },
  ],
  tags: {
    Name: "backend-instance",
  },
});



// Auto Scaling Group for Backend Services
const backendAsg = new aws.autoscaling.Group("backend-asg", {
  vpcZoneIdentifier: [privateSubnet1.id, privateSubnet2.id],
  launchTemplate: {
    id: backendLaunchTemplate.id,
    version: "$Latest",
  },
  minSize: 1,
  maxSize: 3,
  desiredCapacity: 2,
  healthCheckType: "ELB", // Use ELB health checks
  healthCheckGracePeriod: 300, // Adjust as necessary
  tags: [
    {
      key: "Name",
      value: "backend-instance",
      propagateAtLaunch: true,
    },
  ],
});


// Create an attachment policy for the target group
const targetGroupAttachmentPolicy = new aws.autoscaling.Attachment("backend-target-group-attachment", {
  autoscalingGroupName: backendAsg.name,
  lbTargetGroupArn: backendTargetGroup.arn,
});

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const region = "ap-southeast-1";
const env = "todo-infra-dev";
const cidrBlock = "10.10.0.0/16";

const publicSubnet1Cidr = "10.10.1.0/24"; // Bastion server in this subnet, also the client app is deployed.
const publicSubnet2Cidr = "10.10.2.0/24";

const privateSubnet1Cidr = "10.10.3.0/24";
const privateSubnet2Cidr = "10.10.4.0/24";
const privateSubnet3Cidr = "10.10.5.0/24";

// VPC
const vpc = new aws.ec2.Vpc(`${env}-vpc`, {
  cidrBlock: cidrBlock,
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: { Name: `${env}-vpc` },
});

// Public subnets in two AZs
const publicSubnet1 = new aws.ec2.Subnet(`${env}-public-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: publicSubnet1Cidr,
  availabilityZone: `${region}a`,
  mapPublicIpOnLaunch: true,
  tags: { Name: `${env}-public-sn-1` },
});

const publicSubnet2 = new aws.ec2.Subnet(`${env}-public-sn-2`, {
  vpcId: vpc.id,
  cidrBlock: publicSubnet2Cidr,
  availabilityZone: `${region}b`,
  mapPublicIpOnLaunch: true,
  tags: { Name: `${env}-public-sn-2` },
});

// Private subnets in three AZs. First two private subnets are for Node apps, and the 3rd one is for the Mongo DB.
const privateSubnet1 = new aws.ec2.Subnet(`${env}-private-app-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet1Cidr,
  availabilityZone: `${region}a`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `${env}-private-app-sn-1` },
});

const privateSubnet2 = new aws.ec2.Subnet(`${env}-private-app-sn-2`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet2Cidr,
  availabilityZone: `${region}b`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `${env}-private-app-sn-2` },
});

// Private subnet for Mongo DB
const privateSubnetForDb = new aws.ec2.Subnet(`${env}-private-db-sn-1`, {
  vpcId: vpc.id,
  cidrBlock: privateSubnet3Cidr,
  availabilityZone: `${region}c`,
  mapPublicIpOnLaunch: false,
  tags: { Name: `${env}-private-db-sn-1` },
});

// Internet Gateway
const igw = new aws.ec2.InternetGateway(`${env}-igw`, {
  vpcId: vpc.id,
  tags: { Name: `${env}-igw` },
});

// Public Route Table and Association
const publicRouteTable = new aws.ec2.RouteTable(`${env}-public-rt-1`, {
  vpcId: vpc.id,
  routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
  tags: { Name: `${env}-public-rt-1` },
});

new aws.ec2.RouteTableAssociation(`${env}-public-rt-association-1`, {
  subnetId: publicSubnet1.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${env}-public-rt-association-2`, {
  subnetId: publicSubnet2.id,
  routeTableId: publicRouteTable.id,
});

// Private Route Table
const privateRouteTable = new aws.ec2.RouteTable(`${env}-private-rt-1`, {
  vpcId: vpc.id,
  tags: { Name: `${env}-private-rt-1` },
});

// NAT Gateway
const eip = new aws.ec2.Eip(`${env}-nat-eip`, { vpc: true });

const natGateway = new aws.ec2.NatGateway(`${env}-nat-gateway`, {
  allocationId: eip.id,
  subnetId: publicSubnet1.id,
  tags: { Name: `${env}-nat-gateway` },
});

// Private Route and NAT Gateway Association
new aws.ec2.Route(`${env}-private-route-to-nat`, {
  routeTableId: privateRouteTable.id,
  destinationCidrBlock: "0.0.0.0/0",
  natGatewayId: natGateway.id,
});

// Route Table Associations for Node App and DB subnets
new aws.ec2.RouteTableAssociation(`${env}-private-rt-association-1`, {
  subnetId: privateSubnet1.id,
  routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${env}-private-rt-association-2`, {
  subnetId: privateSubnet2.id,
  routeTableId: privateRouteTable.id,
});

new aws.ec2.RouteTableAssociation(`${env}-private-rt-association-3`, {
  subnetId: privateSubnetForDb.id,
  routeTableId: privateRouteTable.id,
});

const publicSnSecurityGroup = new aws.ec2.SecurityGroup(`${env}-public-sn-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"],
    }, // Allow SSH from local host to Bastion server
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: `${env}-app-sg`, // Change the app into sn
  },
});

// ALB Security Group
const albSecurityGroup = new aws.ec2.SecurityGroup(`${env}-alb-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
    },
    {
      protocol: "tcp",
      fromPort: 443,
      toPort: 443,
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
  tags: {
    Name: `${env}-alb-sg`,
  },
});

// Application Security Group for node App
const appSecurityGroup = new aws.ec2.SecurityGroup(`${env}-app-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      securityGroups: [albSecurityGroup.id],
    },
    {
      protocol: "tcp",
      fromPort: 443,
      toPort: 443,
      securityGroups: [albSecurityGroup.id],
    },
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: [publicSubnet1Cidr], // Only from public subnet 1 CIDR, i.e., Bastion server can SSH
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
  tags: {
    Name: `${env}-app-sg`,
  },
});

// DB security group
const dbSecurityGroup = new aws.ec2.SecurityGroup(`${env}-db-sg`, {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "tcp",
      fromPort: 27017,
      toPort: 27017,
      securityGroups: [appSecurityGroup.id],
    },
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: [publicSubnet1Cidr], // Only from public subnet 1 CIDR, i.e., the Bastion server can SSH
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
  tags: {
    Name: `${env}-db-sg`,
  },
});

// Fetch the latest Ubuntu AMI for the EC2 instances
const ubuntuAmiId = aws.ec2
  .getAmi({
    mostRecent: true,
    owners: ["amazon"],
    filters: [
      {
        name: "name",
        values: ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"],
      },
    ],
  })
  .then((ami) => ami.id);

// Key pair for EC2 instances
const keyPair = new aws.ec2.KeyPair(`${env}-keyname`, {
  keyName: "todoKeyPair",
  publicKey: `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCQWXN6x3aCo5J7YKtq+yuDqiK5MT4In46TO4fuWWBhZuyB1GUa/uov0Nzu8+IjS/7hMvRZuhbMDe1olJuPHc0vPpuORjsOac/46ayZ02Mu7RIzGVhA0Z+dSobHkO4+hVc2HduhXWnvhYQfClV1ozvNctQhe+xCDiCFScC201vZAHczLY4ak9PNkN/qEf/I47E+VOp+BD53ld90GoiK27wExX0Q5EUXbn7ATznHA7RRP6vsyt7wL7RCOE3quxsjNvaS3et00mG9dpN+CEYemlFXii8lopHMpJV30+96ypbPyVLXGjhVd8V7mTvQJoHgsYS36R/gal+TieeEVD7YG/CD mehboob@pop-os`,
});

// Bastion EC2 instance
const bastionInstance = new aws.ec2.Instance(`${env}-bastion-instance`, {
  instanceType: "t2.micro",
  ami: ubuntuAmiId,
  subnetId: publicSubnet1.id,
  vpcSecurityGroupIds: [publicSnSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: `#!/bin/bash
set -o errexit
set -o nounset
apt-get update -y
apt-get install -y docker.io
systemctl enable docker
systemctl start docker
docker pull bayajid23/simply-done-client:latest
docker run -d -p 5173:80 bayajid23/simply-done-client:latest
echo "Bastion instance setup completed and frontend app is running on port 5173" > /home/ubuntu/setup.log
`,
  tags: {
    Name: `${env}-bastion-instance`,
  },
});

// Private subnet EC2 instances for Node app
const nodeInstance1 = new aws.ec2.Instance(`${env}-node-instance-1`, {
  instanceType: "t2.micro",
  ami: ubuntuAmiId,
  subnetId: privateSubnet1.id,
  vpcSecurityGroupIds: [appSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: `#!/bin/bash
set -o errexit
set -o nounset
apt-get update -y
apt-get install -y docker.io
apt-get install -y mongodb-clients
systemctl enable docker
systemctl start docker
docker pull bayajid23/simply-done-server:latest
docker run -d -p 5000:5000 -e MONGODB_URI=mongodb://10.10.5.0:27017/simplyDone bayajid23/simply-done-server:latest
echo "Backend instance setup completed and server is running on port 5000, connected to MongoDB" > /home/ubuntu/setup.log
`,
  tags: {
    Name: `${env}-node-instance-1`,
  },
});

const nodeInstance2 = new aws.ec2.Instance(`${env}-node-instance-2`, {
  instanceType: "t2.micro",
  ami: ubuntuAmiId,
  subnetId: privateSubnet2.id,
  vpcSecurityGroupIds: [appSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: `#!/bin/bash
set -o errexit
set -o nounset
apt-get update -y
apt-get install -y docker.io
apt-get install -y mongodb-clients
systemctl enable docker
systemctl start docker
docker pull bayajid23/simply-done-server:latest
docker run -d -p 5000:5000 -e MONGODB_URI=mongodb://10.10.5.0:27017/simplyDone bayajid23/simply-done-server:latest
echo "Backend instance setup completed and server is running on port 5000, connected to MongoDB" > /home/ubuntu/setup.log
`,
  tags: {
    Name: `${env}-node-instance-2`,
  },
});

const mongodbInstance1 = new aws.ec2.Instance(`${env}-mongo-instance-1`, {
  instanceType: "t2.micro",
  ami: ubuntuAmiId,
  subnetId: privateSubnetForDb.id,
  vpcSecurityGroupIds: [dbSecurityGroup.id],
  keyName: keyPair.keyName,
  userData: `#!/bin/bash
set -o errexit
set -o nounset
apt-get update -y
apt-get install -y mongodb
systemctl enable mongodb
systemctl start mongodb
systemctl status mongodb > /home/ubuntu/mongo_status.log
echo "MongoDB setup complete and running on the instance" > /home/ubuntu/setup.log
`,
  tags: {
    Name: `${env}-mongo-instance-1`,
  },
});

// ALB Target Group
const targetGroup = new aws.lb.TargetGroup(`${env}-tg`, {
  port: 80,
  protocol: "HTTP",
  vpcId: vpc.id,
  targetType: "instance",
  healthCheck: {
    path: "/health",
    interval: 60,
    timeout: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 5,
  },
  tags: {
    Name: `${env}-tg`,
  },
});

// Attach EC2 instances to ALB target group
const instanceTgAttachment1 = new aws.lb.TargetGroupAttachment(
  `${env}-instance-tg-attachment-1`,
  {
    targetGroupArn: targetGroup.arn,
    targetId: nodeInstance1.id,
    port: 80,
  }
);

const instanceTgAttachment2 = new aws.lb.TargetGroupAttachment(
  `${env}-instance-tg-attachment-2`,
  {
    targetGroupArn: targetGroup.arn,
    targetId: nodeInstance2.id,
    port: 80,
  }
);

// ALB
const alb = new aws.lb.LoadBalancer(`${env}-alb`, {
  internal: false,
  securityGroups: [albSecurityGroup.id],
  subnets: [publicSubnet1.id, publicSubnet2.id],
  enableDeletionProtection: false,
  tags: {
    Name: `${env}-alb`,
  },
});

// ALB Listener
const listener = new aws.lb.Listener(`${env}-alb-listener`, {
  loadBalancerArn: alb.arn,
  port: 80,
  protocol: "HTTP",
  defaultActions: [
    {
      type: "forward",
      targetGroupArn: targetGroup.arn,
    },
  ],
  tags: {
    Name: `${env}-listener`,
  },
});

const MONGODB_URI = "mongodb://user:example@10.10.5.10:27017/todoApp";

const userData = `#!/bin/bash
          set -o errexit
          set -o nounset

          # Update and install essential packages
          sudo apt update -y
          sudo apt upgrade -y
          sudo apt install -y docker.io

          # Add the Docker user to the group
          sudo usermod -aG docker ubuntu
          newgrp docker

          # Run the Node.js app container
          docker run -d --name simply-done-server \
            -e MONGODB_URI=${MONGODB_URI} \
            -p 80:80 \
            bayajid23/simply-done-server:latest
`;

// Launch Template for ASG
const launchTemplate = new aws.ec2.LaunchTemplate(`${env}-node-app-lt`, {
  name: `${env}-node-app-lt`,
  imageId: ubuntuAmiId,
  instanceType: "t2.micro",
  keyName: keyPair.keyName,
  userData: Buffer.from(userData).toString("base64"),
  networkInterfaces: [
    {
      associatePublicIpAddress: "false",
      securityGroups: [appSecurityGroup.id],
      subnetId: privateSubnet1.id,
    },
  ],
  tags: {
    Name: `${env}-node-app-lt`,
  },
});

// Auto Scaling Group
const asg = new aws.autoscaling.Group(`${env}-node-app-asg`, {
  vpcZoneIdentifiers: [privateSubnet1.id, privateSubnet2.id],
  desiredCapacity: 2,
  minSize: 1,
  maxSize: 5,
  launchTemplate: {
    id: launchTemplate.id,
    version: "$Latest",
  },
  targetGroupArns: [targetGroup.arn],
  tags: [
    {
      key: "Name",
      value: `${env}-node-instance-managed-by-asg`,
      propagateAtLaunch: true,
    },
  ],
});

// Scaling Policies for ASG
const scaleUpPolicy = new aws.autoscaling.Policy(`${env}-node-asg-scale-up`, {
  scalingAdjustment: 1,
  adjustmentType: "ChangeInCapacity",
  cooldown: 300,
  autoscalingGroupName: asg.name,
});

const scaleDownPolicy = new aws.autoscaling.Policy(
  `${env}-node-asg-scale-down`,
  {
    scalingAdjustment: -1,
    adjustmentType: "ChangeInCapacity",
    cooldown: 300,
    autoscalingGroupName: asg.name,
  }
);

// Export resources
export const vpcId = vpc.id;
export const publicSubnet1Id = publicSubnet1.id;
export const publicSubnet2Id = publicSubnet2.id;
export const igwId = igw.id;
export const publicRouteTableId = publicRouteTable.id;

export const nodeInstance1Id = nodeInstance1.id;
export const nodeInstance2Id = nodeInstance2.id;

export const targetGroupId = targetGroup.id;
export const albId = alb.id;
export const albDnsName = alb.dnsName;
export const listenerId = listener.id;

export const asgName = asg.name;
export const asgArn = asg.arn;
export const asgId = asg.id;
export const asgLaunchTemplateId = launchTemplate.id;

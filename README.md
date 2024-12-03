## SimplyDone: A Highly Available, Containerized To-Do Application

## Table of Contents

- [Problem Statement](#problem-statement)
- [Project Overview](#project-overview)
- [Architecture Overview](#architacture-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Foder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)

## Problem Statement
The objective of this project is to containerize the frontend and backend of a To-Do application using Docker, publish the containers to Docker Hub, and deploy them to multiple AWS EC2 instances for fault tolerance. The solution will include implementing an Application Load Balancer (ALB) to ensure traffic distribution and high availability across instances.


## Project Overview

This project aims to develop a highly available and scalable To-Do application by leveraging Docker, AWS EC2, and an Application Load Balancer (ALB). The frontend and backend of the application will be containerized into separate Docker containers, ensuring portability and consistency across environments. These containers will be published to Docker Hub for easy access and deployment.

The containers will then be deployed to multiple AWS EC2 instances, providing fault tolerance and high availability. To manage traffic and distribute requests evenly across the EC2 instances, an Application Load Balancer (ALB) will be set up. This architecture ensures that the application remains resilient, scalable, and able to handle varying loads without downtime, providing a robust solution for modern cloud-based application deployment.


## Architecture Overview

![image](https://github.com/user-attachments/assets/b4f68403-313a-415b-b6c6-3ba8b2535dde)




The application consists of two main components:
1. **Frontend**: A React.js application that interacts with the backend API to manage To-Do tasks.
2. **Backend**: A Node.js + Express application that exposes a REST API for managing tasks, using MongoDB as the database.

The architecture includes:
- **Docker containers** for both the frontend and backend, ensuring consistency across environments.
- **Multiple EC2 instances** running the containers to ensure **fault tolerance** and **scalability**.
- **Application Load Balancer (ALB)** for distributing incoming traffic evenly across the healthy EC2 instances to ensure **high availability**.


## Features

- **Containerized Application**: The frontend and backend are in separate Docker containers for efficient development, testing, and deployment.
- **Scalable Deployment**: Deployed on multiple AWS EC2 instances for horizontal scaling to handle increased traffic.
- **Fault Tolerance**: Multiple EC2 instances ensure high availability, with other instances serving requests in case of failure.
- **Application Load Balancer (ALB)**: Distributes traffic evenly across EC2 instances, optimizing resource use and user experience.
- **Docker Hub Integration**: Frontend and backend containers are published to Docker Hub for easy access and automated deployment.
- **Cloud-Native Architecture**: Utilizes AWS services like EC2 and ALB for scalability, resilience, and security.
- **High Availability**: Multiple EC2 instances and ALB ensure consistent performance and failover support.
- **Secure and Reliable**: Secure EC2 instances and network routing protect data and ensure safe access.


## Technology Stack

- **Frontend**: 
    React , Tailwidn, Shadcnui, Firebase, React-hook-form, Sweetalert, Zod
- **Backend**: 
    Node, Express, MongoDB, JWT

- **Containerization**: 
  - Docker for creating, managing, and deploying containers.
  - Docker Hub for publishing and accessing the container images.

- **Cloud Infrastructure**: 
  - AWS EC2 for hosting the application instances.
  - AWS Application Load Balancer (ALB) for traffic distribution across instances.

- **Networking**: 
  - AWS VPC for managing network configurations.
  - AWS Security Groups for managing access control to EC2 instances.
  - AWS NAT Gateway for enabling internet access from private subnets.

- **DevOps**: 
  - Pulumi as IAAC to manage AWS resources and automate deployments.

## Folder Structure

## Repository Folder Structure


- `/client` : **Frontend**
  - `/public`: Static files and assets.
  - `/src`: Core application code.
  - `Dockerfile`: Frontend Dockerfile
  - `.env`: Frontend environment variables
  - `package.json`
-  `/server`: **Backend**
    - `/src`: Backend source code.
   - `Dockerfile`: Frontend Dockerfile
    - `.env`: Backend environment variables
   - `package.json`

- `/infrastructure`: **Infrastructure** 
    - `index.ts`: Pulumi IaC files for managing AWS resources includes networking, compute, and scaling setup.
- `docker-compose.yml`: Frontend Dockerfile
- `.env`: Backend environment variables
- `Makefile`: Backend environment variables

## Prerequisites

Before deploying the application, ensure you have the following:

- An **AWS account** with EC2 and ALB setup permissions.
- **Docker** installed on your local machine for building containers.
- **AWS CLI** installed and configured with your credentials.
- A **Docker Hub account** to push your Docker images for accessibility.
- **Node.js** (version 18 or above) and **npm** installed for both frontend and backend applications.
- A **MongoDB instance** (local or MongoDB Atlas) for the backend database.
- **Pulumi** installed for managing AWS infrastructure as code.
- **Vite** installed for the frontend build tool.
- **TypeScript** (version 5 or above) installed for both frontend and backend.
- A **Git account** for version control and project management.
- **IDE/Editor** (e.g., Visual Studio Code) with necessary extensions (Docker, Pulumi, AWS).

## Getting Started
Follow these steps to get the application up and running:

**1. Clone the Repository**

```bash
  git clone https://github.com/yourusername/scalable-todo-app.git
  cd scalable-todo-app

```

**2. Install Dependencies**
- Frontend
```bash
  cd client
  yarn install

```

**3. Set Up Environment Variables**
#### 1. create a **.env** file in the **/client** directory:
- Add your Firebase Configuration
```bash
VITE_apiKey=  # Your Firebase project's API key
VITE_authDomain=  # The authentication domain for your Firebase project
VITE_projectId=  # Your Firebase project ID
VITE_storageBucket=  # The storage bucket URL for Firebase Storage
VITE_messagingSenderId=  # The sender ID for Firebase Cloud Messaging (FCM)
VITE_appId=  # The unique app ID for your Firebase app
VITE_measurementId=  # The measurement ID used for Firebase Analytics

# Backend URL
VITE_APP_BACKEND_ROOT_URL=

```

#### 2. **Backend** create a **.env** file in the **/server** directory:
- Add MongoDB User and password

```bash
DB_USER=jobBoxUser
DB_PASS=BpYbsDKcovw6CmcS

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=

```
### 3. reate a **.env** file in the **root** directory:

- Add MongoDB User and password

```bash
DB_USER=jobBoxUser
DB_PASS=BpYbsDKcovw6CmcS

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=

```

**4. Build Docker Containers**

To build the **client** and **server** run following command
```bash
make build-all
```
**5. Push to Dockerhub**

```bash
make push-all
```

**6. Deploy the Infrastructure**

Run container
```bash
pulumi up
```

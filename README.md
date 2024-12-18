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
- [Api Documentation](#api-documentation)

## Problem Statement
We have to create a To-Do application named SimplyDone, containerize both the frontend and backend, and publish the containers to Docker Hub. These containers will be deployed across multiple AWS EC2 instances to ensure fault tolerance. An Application Load Balancer (ALB) will be implemented to distribute traffic and provide high availability across instances.


## Project Overview

This project aims to develop a robust, cloud-native To-Do application by leveraging modern containerization and cloud deployment technologies. The application, consisting of a frontend and backend, will be containerized using Docker to ensure consistency, portability, and simplified deployments across environments. These Docker images will be published to Docker Hub for centralized access and reuse.

The backend containers will be deployed across multiple AWS EC2 instances managed by an autoscaling group to ensure high availability and fault tolerance. Autoscaling will dynamically adjust the number of backend instances to match traffic demands, optimizing performance and cost-efficiency. An Application Load Balancer (ALB) will be implemented to distribute incoming traffic evenly across backend instances, ensuring smooth operation and reliable user experiences.

The frontend will be containerized and deployed to EC2, remaining independent of the autoscaling and load balancing configuration used for the backend. This architecture will deliver a scalable, resilient, and efficient solution for modern cloud-based application deployment.



## Architecture Overview
The SimplyDone To-Do Application consists of three main components:
![image](https://github.com/user-attachments/assets/b4f68403-313a-415b-b6c6-3ba8b2535dde)
**1. Frontend:**

- A React.js application that provides an intuitive interface for managing To-Do tasks.
- Communicates with the backend API to perform task operations.
- Containerized with Docker for portability and consistent deployment.
  
**2. Backend:**
- A **Node.js** application with **Express**, exposing a **REST API** for task management.
- Uses **MongoDB** as the database for persistent storage.
- Containerized with **Docker** for easy scalability and fault tolerance.
  
**3. Infrastructure:**
- Managed using **Pulumi** for automated, version-controlled infrastructure provisioning.
- **AWS EC2 instances** host the frontend and backend containers, ensuring scalability and fault tolerance.
- **Autoscaling** for backend EC2 instances to dynamically handle varying traffic loads.
- **Application Load Balancer (ALB)** ensures high availability by distributing traffic evenly across healthy EC2 instances.

The architecture includes:

- **Docker containers** for both frontend and backend, ensuring consistency across environments.
- **Multiple EC2 instances** for scalability and fault tolerance.
- **Application Load Balancer (ALB)** for optimized traffic distribution and high availability.

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
  - Pulumi as IAC to manage AWS resources and automate deployments.

## Folder Structure

- `/client` : **Frontend**
  - `/public`: Static files and assets.
  - `/src`: Core application code.
  - `Dockerfile`: Frontend Dockerfile
  - `.env`: Frontend environment variables
  - `package.json`
-  `/server`: **Backend**
    - `/src`: Backend source code.
   - `Dockerfile`: Backend Dockerfile
    - `.env`: Backend environment variables
   - `package.json`

- `/infrastructure`: **Infrastructure** 
    - `index.ts`: Pulumi IaC files for managing AWS resources includes networking, compute, and scaling setup.
- `docker-compose.yml`: Manages the local development environment by defining and running both the frontend and backend containers together, ensuring seamless integration.

- `.env`:  Project nvironment variables for building both containers
- `Makefile`: Automates tasks like building, running, and deploying  Docker containers

## Prerequisites

Before deploying the application, ensure you have the following:

- An **AWS account** with EC2 and ALB setup permissions.
- **Docker** installed on your local machine for building containers.
- **AWS CLI** installed and configured with your credentials.
- A **Docker Hub account** to push your Docker images for accessibility.
- **Node.js** (version 18 or above) and **npm** installed for both frontend and backend applications.
- A **MongoDB instance** (local or MongoDB Atlas) for the backend database.
- **Pulumi** installed for managing AWS infrastructure as code.
- **TypeScript** (version 5 or above) installed for both frontend and backend.

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
### 3. create a **.env** file in the **root** directory:

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

You will see infra is creating...
![Screenshot from 2024-12-18 13-30-13](https://github.com/user-attachments/assets/cb889077-dc9b-4dfd-8e24-400dc7ffbb30)

And when creation is done
![Screenshot from 2024-12-18 13-30-20](https://github.com/user-attachments/assets/335ca9cf-03d6-4747-97ef-370b980e7efb)


Now open browser and write 
``` bash
http://<EC2_INSTANCE_PUBLIC_IP>:5173
```
![Screenshot from 2024-12-18 14-37-17](https://github.com/user-attachments/assets/7fbcd41c-d11f-4a40-a7c7-144c64c31877)

## Api Documentation
This section provides a detailed description of all the APIs, including their request payloads, query parameters, URL parameters, and responses, along with example usage for each endpoint in the application.

### Root url(Local environment)
```
  http://localhost:5000

```
## Check health (GET)
### url
```
    http://localhost:5000/health
```

#### Response would be like this
```
{
    "status": "Up and running!",
    "timestamp": "2024-12-04T07:17:23.538Z",
    "uptime": "0d 0h 0m 20s"
}
```
## Register User (POST)
### url
```
  http://localhost:5000/users
```

### Examples

For register a user your request body should be like following

#### Reqeust body

```
{
    "userName": "BayajidSWE",
    "email": "bayajidalam20@gmail.com",
    "password": "111111"
}
```

#### Response  would be like this
```
{
    "acknowledged": true,
    "insertedId": "675002aea8b348ab91f524d0"
}
```

## Login User (POST)
### url
```
   http://localhost:5000/login
```

### Examples

For login a user your request body should be like following

#### Reqeust body

```
{
    "email": "bayajidalam20@gmail.com",
    "password": "111111"
}
```

#### Response would be like this
```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJheWFqaWRhbGFtMjBAZ21haWwuY29tIiwiaWF0IjoxNzMzMjk2ODU5LCJleHAiOjE3MzMzNDAwNTl9.81VICjEyc86il4QEVi0H5m4ZRCYTO2lIWdQ8Ml1asj4"
}
```



### Get All Users(GET)
### url
```
http://localhost:5000/users
```

### Examples

Get all users of the application

### Response would be like this

```
[
  {
        "_id": "6748134c87460c4c1f1f5372",
        "name": "BayajidSWE",
        "email": "bayajidalam2001@gmail.com",
        "password": "$2b$10$B.VfylXPp8qyNBBVwys.wehcRMjpvttXH3kk5kPHvUX1I/OVtS8wa"
    },
    {
        "_id": "675002aea8b348ab91f524d0",
        "userName": "BayajidSWE",
        "email": "bayajidalam20@gmail.com",
        "password": "$2b$10$529vxbsoJm2b.WXz/qdnletUCkiEyKTiWTPsOv1cW0LH27e3ctJ9m"
    }
]
```

### Change Password(POST)
### url
```
http://localhost:5000/change-password?email=bayajidalam2001@gmail.com
```
### Breakdwon of the url
- email = User Email

### Request body should be follwoing:
```
{
    "currentPassword": "111111",
    "newPassword": "123456"
}
```
### Response would be like this
```
{
    "error": false,
    "data": {
        "acknowledged": true,
        "modifiedCount": 1,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1
    },
    "message": "Password changed successfully!"
}
```

### Get all Notes(POST)
### url
```
http://localhost:5000/notes?email=bayajidalam2001@gmail.com&searchTerm=&isTrashed=false&isArchived=true
```
### Breakdwon of the url
- email = User Email
- searchTerm = Search keyword
- isTrashed = Filering keyword
- isArchived = Filering keyword

### Response would be like this
```
[
    {
        "_id": "67500495a8b348ab91f524d1",
        "title": "Hello Blog",
        "content": "Hello World",
        "isArchived": true,
        "isTrashed": false,
        "email": "bayajidalam2001@gmail.com",
        "isTodo": null,
        "todos": [],
        "createdAt": "2024-12-04T07:28:21.320Z"
    }
]
```


### Create A Note(POST)
### url
```
http://localhost:5000/notes?email=bayajidalam2001@gmail.com
```
### Breakdwon of the url
- email = User Email

### Request body should be follwoing:
```
{
    "title": "Hello Blog",
    "content": "Hello World",
    "isArchived": true,
    "isTrashed": false
}
```
### Response would be like this
```
{
    "acknowledged": true,
    "insertedId": "67500495a8b348ab91f524d1"
}
```

### Update A Note(PATCH)
### url
```
http://localhost:5000/notes/6748c2c384bd166dab558fe8?email=bayajidalam2001@gmail.com
```
### Breakdwon of the url
- 6748c2c384bd166dab558fe8 = Note id
- email = User Email

### Request body should be follwoing:
```
{
    "title": "Updated Blog",
    "isArchived": true,
    "isTrashed":false
}
```
### Response would be like this
```
{
    "success": true,
    "message": "Note updated successfully",
    "note": {
        "_id": "67500495a8b348ab91f524d1",
        "title": "Updated Blog",
        "content": "Hello World",
        "isArchived": true,
        "isTrashed": false,
        "email": "bayajidalam2001@gmail.com",
        "isTodo": null,
        "todos": [],
        "createdAt": "2024-12-04T07:28:21.320Z"
    }
}
```



### Get A Note(GET)
### url
```
http://localhost:5000/notes/67500495a8b348ab91f524d1
```
### Breakdwon of the url
- 6748c2c384bd166dab558fe8 = Note id


### Response would be like this
```
{
    "_id": "67500495a8b348ab91f524d1",
    "title": "Updated Blog",
    "content": "Hello World",
    "isArchived": true,
    "isTrashed": false,
    "email": "bayajidalam2001@gmail.com",
    "isTodo": null,
    "todos": [],
    "createdAt": "2024-12-04T07:28:21.320Z"
}
```

### Delete A Note(Delete)
### url
```
http://localhost:5000/notes/67500495a8b348ab91f524d1
```
### Breakdwon of the url
- 6748c2c384bd166dab558fe8 = Note id


### Response would be like this
```
{
  "acknowledged": true,
  "deletedCount": 1
}
```


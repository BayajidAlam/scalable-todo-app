# Highly Available, Containerized To-Do Application

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
### Tech Stack

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

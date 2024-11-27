# Highly Available, Containerized To-Do Application

This project implements a **highly available, containerized To-Do application** deployed across multiple AWS EC2 instances. The backend and frontend of the application are containerized using Docker and deployed with fault tolerance and high availability via an **Application Load Balancer (ALB)** in AWS.

## Architecture Overview

The application consists of two main components:
1. **Frontend**: A React.js application that interacts with the backend API to manage To-Do tasks.
2. **Backend**: A Node.js + Express application that exposes a REST API for managing tasks, using PostgreSQL as the database.

The architecture includes:
- **Docker containers** for both the frontend and backend, ensuring consistency across environments.
- **Multiple EC2 instances** running the containers to ensure **fault tolerance** and **scalability**.
- **Application Load Balancer (ALB)** for distributing incoming traffic evenly across the healthy EC2 instances to ensure **high availability**.

## Features
- **High Availability**: Traffic is distributed across multiple EC2 instances, ensuring continuous availability even in case of failure.
- **Fault Tolerance**: If an EC2 instance fails, the ALB redirects traffic to healthy instances, minimizing downtime.
- **Scalable**: Easily add more EC2 instances to handle increased traffic.

## Prerequisites

Before deploying the application, ensure you have the following:
- An **AWS account** with EC2 and ALB setup permissions.
- **Docker** installed on your local machine for building containers.
- **AWS CLI** installed and configured with your credentials.
- A **Docker Hub account** to push your Docker images for accessibility.
- **Node.js** and **React.js** setup for the frontend and backend applications.

## Directory Structure


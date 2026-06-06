# Medical Appointment System

A fullstack web application for managing medical appointments between patients and doctors.

🔗 **Live Demo:** [your-app.railway.app](https://your-app.railway.app)

---

## Features

- 🔐 JWT Authentication with role-based access (patient / doctor)

- 👨‍⚕️ Doctor listing with specialties

- 📅 Appointment booking with conflict detection

- 📋 Patient dashboard to view and cancel appointments

- 🏥 Doctor dashboard to view daily schedule

- 🐳 Fully containerized with Docker

## Tech Stack

| Layer | Technology |

|-------|-----------|

| Frontend | React 18 + TypeScript + Vite |

| Backend | Node.js + Express + TypeScript |

| Database | PostgreSQL 15 |

| Auth | JWT + bcryptjs |

| DevOps | Docker + Docker Compose |

| Deploy | Railway |

## Architecture

![Architecture Diagram](./architecture.png)

## Getting Started

### Prerequisites

- Docker and Docker Compose installed

- Node.js 18+ (for local development without Docker)

### Run with Docker

```bash

git clone https://github.com/ElizabethP15/medical-appointment-system.git

cd medical-appointment-system

cp backend/.env.example backend/.env   # fill in your values

docker-compose up --build

Open http://localhost in your browser.
```

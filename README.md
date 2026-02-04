# Student Manager (Fullstack) 
A fullstack application for user registration/login and managing a personal list of students (CRUD).

Each user can view and manage only their own students linked by userId.

## Features
User registration and login (JWT authentication)

Protected routes (middleware + token)

Profile management: update fullName, email, and password

Students (CRUD):

- list of students belonging only to the current user
- search by first letters (startsWith)
- pagination (10 records per page)
- Add / Edit / Delete

## Technologies
Backend: Node.js, Express, MongoDB (Mongoose), JWT, CORS(Cross-Origin Resource Sharing)

Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS

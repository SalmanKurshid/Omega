Node.js CRUD and Authentication APIs

Description:
This project provides a set of CRUD APIs along with a login API and authentication mechanisms implemented in Node.js. It allows users to perform Create, Read, Update, and Delete operations on certain resources, with authentication required for accessing protected endpoints.

Installation:
1.Clone this repository.

2.Navigate to the project directory.

3.Run the following command to install dependencies:
  npm install

Usage:
1.Start the server by running:
  node index.js
2.Access the APIs using a tool like Postman or curl.
  
Endpoints:
GET /api/v1/users: Retrieve all users.
POST /api/v1/users: Create a new user.
PUT /api/v1/users: Update user with the specified ID.
DELETE /api/v1/delete-user: Delete user with the specified ID.
POST /api/v1/login: Authenticate user and receive an authentication token.
GET /api/v1/healthcheck: For checking status of all the APIs.
GET /api/v1/weatherByLocation: For getting weather of any location by its name

Authentication:
To authenticate, send a POST request to /api/v1/login with your username and password. Upon successful authentication, you will receive an authentication token. Include this token in the Authorization header of subsequent requests to access protected endpoints.

Contributing:
If you encounter any bugs or have suggestions for improvements, please open an issue or submit a pull request. Contributions are welcome!

Contact:
For any inquiries or feedback, feel free to contact us at salmankurshid2@gmail.com

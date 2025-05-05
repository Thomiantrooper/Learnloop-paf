
# **LearnLoop: Skill-Sharing & Learning Platform** 

## **Overview** 📖

LearnLoop is a dynamic **Skill-Sharing & Learning Platform** designed to empower users to learn, share knowledge, and enhance their coding skills in a collaborative community. Users can create and share skill-based content, track their learning progress, and connect with like-minded learners. This platform integrates **AI-driven insights**, **interactive learning progress updates**, and **real-time notifications** to create a holistic learning environment.

The platform is built using **React** for the frontend, **Spring Boot** for the backend, and utilizes **OAuth 2.0** for secure authentication.

## **Features** 🔑

- **🌐 User Authentication**: Seamless login via OAuth 2.0 (e.g., Google login) for a secure and quick onboarding process.
- **👥 User Profiles**: Each user can manage a personalized profile, share learning progress, and showcase their contributions to the community.
- **📚 Skill-Sharing Posts**: Users can create and share posts (up to 3 photos or short videos) related to coding tutorials, tips, and resources.
- **💡 AI Insight**: Get personalized learning suggestions with the help of AI, and add, email, or download notes to track progress.
- **🔔 Notifications**: Real-time alerts for post interactions (likes, comments) to keep users engaged with the community.
- **📝 Learning Plan Sharing**: Users can create and share structured learning plans, track progress, and make learning goals.
- **💬 Interactivity**: Users can like, comment, and interact with shared content, with support for comment editing and deletion.

## **Technologies** 💻

- **Frontend**: Built with **React.js**, styled using **Tailwind CSS**, and integrated with **Axios** for API communication.
- **Backend**: Powered by **Spring Boot** for developing secure and scalable REST APIs.
- **Database**: **MongoDB** for managing dynamic and user-generated content & **Superbase** for storing posts.
- **Authentication**: **OAuth 2.0** (e.g., Google) for easy and secure login.
- **Version Control**: Managed via **GitHub** for seamless collaboration.

## **Installation** ⚙️

### **Prerequisites** 📦
1. **Node.js** and **npm** for the frontend.
2. **Java** (preferably OpenJDK 11 or later) for the backend.
3. **MongoDB** (local or cloud service like MongoDB Atlas).

### **Setup** 🛠️

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Thomiantrooper/Learnloop-paf
   ```

2. **Frontend Setup**:
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend/client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm start
     ```

3. **Backend Setup**:
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Build the Spring Boot application:
     ```bash
     mvn clean install
     ```
   - Run the application:
     ```bash
     mvn spring-boot:run
     ```

4. **Database**:
   - Ensure MongoDB is running locally or configure a cloud database (e.g., MongoDB Atlas).

## **Usage** 🎯

- **User Authentication**: Log in via Google using OAuth 2.0 for a secure and seamless experience.
- **Create Skill-Sharing Posts**: Share coding tutorials, tips, and videos with the community.
- **Track Learning Progress**: Post updates and receive AI-powered learning suggestions.
- **Learning Plans**: Create, share, and track progress on learning plans with topics and resources.

## **License** 📝
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## **Acknowledgments** 🎉
- **Kanzurrizk M R A** (IT22166524) – Contributed on **OAuth authentication** and **AI Insight**.
- **Kajanthan K** (IT22197214) – Worked on **REST API for skill-sharing** and **post feed**.
- **Peiris M D T N** (IT22109408) – Worked on **plan-sharing** and **frontend development**.
- **Ashwin V** (IT22204448) – Contributed to **user profile** and **progress updates**.

## **References** 🌐
- [What is an API?](https://www.wallarm.com/what/the-concept-of-an-api-gateway)
- [OAuth 2.0 Overview](https://auth0.com/intro-to-iam/what-is-oauth-2)
- [React Documentation](https://react.dev/learn)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/index.html)

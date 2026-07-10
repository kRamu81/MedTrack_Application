<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<div align="center">
  
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/kRamu81/MedTrack_Application">
    <!-- Replace with your actual logo -->
    <img src="https://raw.githubusercontent.com/othneildrew/Best-README-Template/master/images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">🏥 MedTrack</h3>

  <p align="center">
    <strong>A Full-Stack Medical Equipment Management & Tracking System</strong>
    <br />
    <a href="https://github.com/kRamu81/MedTrack_Application"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://discord.gg/F7TUpgPzJ">Join Discord</a>
    ·
    <a href="https://github.com/kRamu81/MedTrack_Application/issues">Report Bug</a>
    ·
    <a href="https://github.com/kRamu81/MedTrack_Application/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#core-features">Core Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage & Test Accounts</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

MedTrack is a **Full-Stack Medical Equipment Management Platform** that helps hospitals manage their equipment inventory, maintenance schedules, and equipment orders efficiently.

The system is designed with a microservice-oriented backend and a responsive React frontend, created specifically for the **MedTrack Case Study 06** during the Elite Summer of Code (ECSoc).

### Core Features
The system supports three major roles:
* 🏥 **Hospital**: Manage inventory, schedule maintenance, and order equipment.
* 🔧 **Technician**: View and complete assigned maintenance tasks.
* 🚚 **Supplier**: Fulfill equipment orders and update delivery status.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![React][React.js]][React-url]
* [![Tailwind][Tailwind.css]][Tailwind-url]
* [![Spring][Spring.io]][Spring-url]
* [![Java][Java.com]][Java-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Java 17 or higher
* Node.js (v16+)
* npm (v8+)
* Maven

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/kRamu81/MedTrack_Application.git
   ```
2. **Start the Backend**
   ```sh
   cd Backend
   mvn spring-boot:run
   ```
   * **API URL**: `http://localhost:8081`
   * **H2 Console**: `http://localhost:8081/h2-console` (JDBC: `jdbc:h2:mem:medtrackdb`, User: `sa`)

3. **Start the Frontend**
   ```sh
   # Open a new terminal in the root directory
   npm install
   npm start
   ```
   * **App URL**: `http://localhost:3000/MedTrack_Application`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage & Test Accounts

Use the following default accounts to test the different role dashboards:

| Role | Email | Password |
|------|-------|----------|
| Hospital Admin | `hospital@medtrack.com` | `admin123` |
| Technician | `tech@medtrack.com` | `tech123` |
| Supplier | `supplier@medtrack.com` | `supply123` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for full details on how to get started, assign yourself an issue, and submit a Pull Request.

**Quick Steps:**
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

##  Top Contributors

<a href="https://github.com/kRamu81/MedTrack_Application/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kRamu81/MedTrack_Application" alt="Contributors" />
</a>


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Project Link: [https://github.com/kRamu81/MedTrack_Application](https://github.com/kRamu81/MedTrack_Application)

💬 **Join our Discord Community:** [https://discord.gg/F7TUpgPzJ](https://discord.gg/F7TUpgPzJ)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/kRamu81/MedTrack_Application.svg?style=for-the-badge
[contributors-url]: https://github.com/kRamu81/MedTrack_Application/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/kRamu81/MedTrack_Application.svg?style=for-the-badge
[forks-url]: https://github.com/kRamu81/MedTrack_Application/network/members
[stars-shield]: https://img.shields.io/github/stars/kRamu81/MedTrack_Application.svg?style=for-the-badge
[stars-url]: https://github.com/kRamu81/MedTrack_Application/stargazers
[issues-shield]: https://img.shields.io/github/issues/kRamu81/MedTrack_Application.svg?style=for-the-badge
[issues-url]: https://github.com/kRamu81/MedTrack_Application/issues
[license-shield]: https://img.shields.io/github/license/kRamu81/MedTrack_Application.svg?style=for-the-badge
[license-url]: https://github.com/kRamu81/MedTrack_Application/blob/master/LICENSE
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Spring.io]: https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white
[Spring-url]: https://spring.io/projects/spring-boot
[Java.com]: https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white
[Java-url]: https://java.com/

<!-- final test -->

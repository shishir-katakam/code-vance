# Codevance

**Codevance** is a modern web application designed to help developers intelligently track, manage, and visualize their coding journey across multiple platforms like LeetCode, CodeChef, GeeksforGeeks, and more. With real-time statistics, interactive dashboards, and AI-powered learning recommendations, Codevance makes it easy to monitor your progress and plan your next steps in programming skill development.

Main Features

Landing Page with Real-time Stats
- Displays live statistics on active developers, problems tracked, and sync accuracy.
- Visually appealing hero section with modern animations, gradients, and call-to-actions.
- Real-time data updates from the backend (Supabase).

Interactive Demo Tour
- "Watch Demo" feature offers a guided tour highlighting all core features.
- Educates new users on functionality with clear, multi-step tooltips.
- Important notices about API limitations (e.g., limited to total solved problem counts).

Secure Authentication
- User authentication and session handling powered by **Supabase**.
- Supports signup, login, and secure state management.

Personalized Dashboard
- **Problem Collection**: Add, manage, and toggle coding problems.
- **Stats Cards**: Instant overview of total problems, completion rate, and weekly coding activity.
- **Tabs**:
  - **Problems**: Manage and search your personal problem list.
  - **Accounts**: Link external platform profiles (LeetCode, CodeChef, GFG, Codeforces).
  - **Progress**: Track topic-wise mastery.
  - **Analytics**: Visualize activity trends and problem difficulty distribution with charts.
- Real-time UI updates for all user actions.

Platform Integration & Sync
- Supports syncing with LeetCode, CodeChef, GeeksforGeeks, and Codeforces.
- Pulls solved problem counts and other data, subject to platform API limitations.

AI-driven Insights
- Generates personalized learning recommendations (feature under expansion).
- Suggests problem areas based on user history.

Responsive & Modern Design
- Fully mobile-optimized.
- Smooth animations, transitions, and a clean, modern aesthetic.

Security & Privacy
- All backend logic secured via **Supabase**.
- No sensitive API keys exposed on the frontend.
- Adheres to best practices for secure data handling.

Live Now

[https://code-vance.vercel.app](https://code-vance.vercel.app)

Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend & Auth**: Supabase
- **Deployment**: Vercel

Setup Instructions (Local Development)

```bash
git clone https://github.com/your-username/codevance.git
cd codevance
# Open index.html in your preferred browser to run the app

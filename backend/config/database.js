// In-memory database
const database = {
    users: [],
    projects: [],
    tasks: [],
    comments: []
};

// Seed initial data
function seedData() {
    if (database.users.length === 0) {
        const sampleUsers = [
            {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                password: Buffer.from("password123").toString('base64'),
                role: "project_manager",
                avatar: "https://ui-avatars.com/api/?name=John+Doe&background=3498db&color=fff",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Sarah Wilson",
                email: "sarah@example.com",
                password: Buffer.from("password123").toString('base64'),
                role: "developer",
                avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=e74c3c&color=fff",
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: "Mike Chen",
                email: "mike@example.com",
                password: Buffer.from("password123").toString('base64'),
                role: "designer",
                avatar: "https://ui-avatars.com/api/?name=Mike+Chen&background=27ae60&color=fff",
                createdAt: new Date().toISOString()
            }
        ];
        database.users.push(...sampleUsers);
    }

    if (database.projects.length === 0) {
        const sampleProjects = [
            {
                id: 1,
                name: "Website Redesign",
                description: "Complete redesign of company website with modern technologies",
                ownerId: 1,
                members: [1, 2, 3],
                status: "in-progress",
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Mobile App Development",
                description: "Development of cross-platform mobile application",
                ownerId: 1,
                members: [1, 2],
                status: "planning",
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        database.projects.push(...sampleProjects);
    }

    if (database.tasks.length === 0) {
        const sampleTasks = [
            {
                id: 1,
                title: "Design Homepage Layout",
                description: "Create wireframes and mockups for the new homepage",
                projectId: 1,
                assigneeId: 3,
                status: "in-progress",
                priority: "high",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Implement User Authentication",
                description: "Develop secure user authentication system",
                projectId: 1,
                assigneeId: 2,
                status: "todo",
                priority: "medium",
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                title: "Project Planning Session",
                description: "Initial planning and requirement gathering",
                projectId: 2,
                assigneeId: 1,
                status: "completed",
                priority: "low",
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        database.tasks.push(...sampleTasks);
    }

    if (database.comments.length === 0) {
        const sampleComments = [
            {
                id: 1,
                taskId: 1,
                userId: 2,
                content: "The design looks great! Can we add more spacing between sections?",
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                taskId: 1,
                userId: 3,
                content: "Sure, I'll update the spacing in the next iteration.",
                createdAt: new Date().toISOString()
            }
        ];
        database.comments.push(...sampleComments);
    }
}

// Initialize data
seedData();

module.exports = database;
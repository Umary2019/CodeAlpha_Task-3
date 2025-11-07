class Task {
    constructor(id, title, description, projectId, assigneeId, createdBy) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.projectId = projectId;
        this.assigneeId = assigneeId;
        this.status = "todo";
        this.priority = "medium";
        this.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        this.createdBy = createdBy;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = Task;
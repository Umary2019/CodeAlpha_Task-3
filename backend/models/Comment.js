class Comment {
    constructor(id, taskId, userId, content) {
        this.id = id;
        this.taskId = taskId;
        this.userId = userId;
        this.content = content;
        this.createdAt = new Date().toISOString();
    }
}

module.exports = Comment;
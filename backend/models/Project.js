class Project {
    constructor(id, name, description, ownerId, members = []) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
        this.members = members.includes(ownerId) ? members : [...members, ownerId];
        this.status = "planning";
        this.startDate = new Date().toISOString();
        this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = Project;
class User {
    constructor(id, name, email, password, role = "member") {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        this.createdAt = new Date().toISOString();
    }
}

module.exports = User;
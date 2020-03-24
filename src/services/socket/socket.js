const addUser = ({ id, name, room }, users) => {
    let user;
    try {
        name = name.replace(/\s+/g, '').toLowerCase();
        room = room.replace(/\s+/g, '').toLowerCase();

        const userInList = users.find(
            user => user.name === name && user.room === room
        );
        if (userInList) {
            return { error: 'The username has already been taken in the chat room!' };
        }

         user = { id, name, room };
        users.push(user);
        return {error: null ,user, users};
    } catch (e) {
        return {error: e ,user, users};

    }


};

const deleteUser = (id, users) => {
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === undefined) {
        return {
            users: users,
            user: users.splice(userIndex, 1)
        };
    }
    return {
        users: users,
        user: undefined
    };
};

const getUser = (id, users) => {
    console.log("get =>", id);
    return {
        user : users.find(user => user.id === id),
        users : users
    };
};

const getUsersInRoom = (room, users) => users.filter(user => user.room === room);

module.exports = { addUser, deleteUser, getUser, getUsersInRoom };
import React from "react";

const getCurrentUser = () => {
    try {
        let user = localStorage.getItem("spendwise_user");
        const permissions = localStorage.getItem('spendwise_permissions');
        let parseduser = {
            ...JSON.parse(user),
            permissions: JSON
            .parse(permissions)
        };
        return parseduser ?? null;
    } catch (err) {
        console.error("Invalid user data in localStorage", err);
        return null;
    }
};

export default getCurrentUser;
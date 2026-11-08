CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL,

    CONSTRAINT uq_project_members_project_user
        UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_user_id
    ON project_members (user_id);

INSERT INTO project_members (project_id, user_id, role)
SELECT id, user_id, 'OWNER'
FROM projects;

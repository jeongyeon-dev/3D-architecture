CREATE TABLE project_objects_normalized (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    object_id INTEGER NOT NULL,
    object_data JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_project_objects_project_object UNIQUE (project_id, object_id)
);

INSERT INTO project_objects_normalized (project_id, object_id, object_data, updated_at)
SELECT
    project_object.project_id,
    (object_data ->> 'id')::INTEGER,
    object_data,
    project_object.updated_at
FROM project_objects project_object
CROSS JOIN LATERAL json_array_elements(
    CASE
        WHEN json_typeof(project_object.objects) = 'array' THEN project_object.objects
        ELSE '[]'::JSON
    END
) AS object_data;

DROP TABLE project_objects;

ALTER TABLE project_objects_normalized RENAME TO project_objects;

CREATE INDEX idx_project_objects_project_id
    ON project_objects (project_id);

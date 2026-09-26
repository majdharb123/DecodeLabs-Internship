CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL
        CHECK (char_length(trim(title)) > 0),
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low','medium','high')),
    due_date DATE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX If NOT EXISTS
idx_tasks_created_at
ON tasks (created_at DESC);
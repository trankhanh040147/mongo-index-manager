package taskqueue

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Task struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Type      string             `bson:"type"`
	Payload   []byte             `bson:"payload"`
	Status    string             `bson:"status"`
	LockedAt  *time.Time         `bson:"locked_at,omitempty"`
	LockedBy  string             `bson:"locked_by,omitempty"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
}

type TaskInfo struct {
	ID        string
	Type      string
	Payload   []byte
	State     string
	CreatedAt time.Time
}

const (
	TaskStatusPending    = "pending"
	TaskStatusProcessing = "processing"
	TaskStatusCompleted  = "completed"
	TaskStatusFailed     = "failed"
)

const TaskCollectionName = "tasks"

const (
	TaskTypeSyncIndexByCollection = "index:sync-collection"
)

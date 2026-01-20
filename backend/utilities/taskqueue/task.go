package taskqueue

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Task struct {
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
	LockedAt  *time.Time         `bson:"locked_at,omitempty"`
	Type      string             `bson:"type"`
	Status    string             `bson:"status"`
	LockedBy  string             `bson:"locked_by,omitempty"`
	Payload   []byte             `bson:"payload"`
	ID        primitive.ObjectID `bson:"_id,omitempty"`
}

type TaskInfo struct {
	CreatedAt time.Time
	ID        string
	Type      string
	State     string
	Payload   []byte
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

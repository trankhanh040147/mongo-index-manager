package queries

import (
	"time"
)

type AccountUpdateProfileByIdRequest struct {
	UpdatedAt time.Time
	FirstName string
	LastName  string
	Avatar    string
}

type DatabaseUpdateInfoByIdRequest struct {
	Name        string
	Description string
	Uri         string
	DBName      string
}

type IndexGetCollectionsByDatabaseIdAndQueryData struct {
	Collection   string `bson:"_id"`
	TotalIndexes int    `bson:"total_indexes"`
}

package queries

import (
	"time"
)

type AccountUpdateProfileByIdRequest struct {
	UpdatedAt time.Time
	FirstName string
	LastName  string
	Avatar    string
	Phone     string
}

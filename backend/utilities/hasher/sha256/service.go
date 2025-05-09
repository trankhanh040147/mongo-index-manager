package sha256

import (
	"crypto/sha256"

	"doctor-manager-api/utilities/hasher"
)

func New() hasher.Service {
	return hasher.New(sha256.New())
}

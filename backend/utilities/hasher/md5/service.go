package md5

import (
	"crypto/md5" //nolint:gosec

	"doctor-manager-api/utilities/hasher"
)

func New() hasher.Service {
	return hasher.New(md5.New()) //nolint:gosec
}

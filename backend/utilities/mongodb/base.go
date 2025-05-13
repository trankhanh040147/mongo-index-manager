package mongodb

import (
	"time"

	"doctor-manager-api/common/logging"
)

const defaultContextTimeout = 10 * time.Second

var logger = logging.GetLogger()

type Service interface {
	TestConnection(uri string) error
}

type service struct{}

func New() Service {
	return &service{}
}

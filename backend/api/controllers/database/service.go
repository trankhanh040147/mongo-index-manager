package database

type serviceInterface interface {
}

type service struct{}

func newService() serviceInterface {
	return &service{}
}

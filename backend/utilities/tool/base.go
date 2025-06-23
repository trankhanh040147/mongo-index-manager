package tool

type Service interface {
	DeaccentVietnameseString(value string) string
	Slugify(value string) string
	SlugifyWithoutHyphen(value string) string
	SlugifyWithoutHyphenAndUnderscore(value string) string
	GenerateRandomString(length int) string
}

type service struct{}

func New() Service {
	return &service{}
}

package tool

import (
	"bytes"
	"crypto/rand"
	"strings"
	"unicode"

	"github.com/gosimple/slug"
	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func (s *service) DeaccentVietnameseString(value string) string {
	value = strings.ToLower(value)
	value = strings.ReplaceAll(value, "đ", "d")
	valueBytes := make([]byte, len(value))

	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	_, _, _ = t.Transform(valueBytes, []byte(value), true)
	return string(bytes.TrimRight(valueBytes, "\x00"))
}

func (s *service) Slugify(value string) string {
	return slug.Make(value)
}

func (s *service) SlugifyWithoutHyphen(value string) string {
	value = slug.Make(value)
	return strings.ReplaceAll(value, "-", "")
}

func (s *service) GenerateRandomString(length int) string {
	chars := make([]byte, length)
	if _, err := rand.Read(chars); err != nil {
		return ""
	}
	for i := 0; i < length; i++ {
		chars[i] = charset[chars[i]%byte(len(charset))]
	}
	return string(chars)
}

func (s *service) SlugifyWithoutHyphenAndUnderscore(value string) string {
	value = slug.Make(value)
	return strings.ReplaceAll(strings.ReplaceAll(value, "-", ""), "_", "")
}

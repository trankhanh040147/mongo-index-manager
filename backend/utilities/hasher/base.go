package hasher

import (
	"encoding/hex"
	"hash"
	"io"
)

type Service interface {
	Encode(value string) ([]byte, error)
	EncodeToHexString(value string) string
	Hex(value []byte) []byte
	Reset()
}

type service struct {
	hashFunction hash.Hash
}

func New(hashFunction hash.Hash) Service {
	return &service{
		hashFunction: hashFunction,
	}
}

func (s *service) Encode(value string) ([]byte, error) {
	if _, err := io.WriteString(s.hashFunction, value); err != nil {
		return nil, err
	}
	return s.hashFunction.Sum(nil), nil
}

func (s *service) Hex(value []byte) []byte {
	hexDigitsPerByte := 2
	hexValue := make([]byte, len(value)*hexDigitsPerByte)
	_ = hex.Encode(hexValue, value)
	return hexValue
}

func (s *service) EncodeToHexString(value string) string {
	s.hashFunction.Write([]byte(value))
	return hex.EncodeToString(s.hashFunction.Sum(nil))
}

func (s *service) Reset() {
	s.hashFunction.Reset()
}

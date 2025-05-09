package response

import (
	"errors"
	"fmt"
	"reflect"

	"doctor-manager-api/common/request"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/utils"
)

type Options struct {
	Extra   fiber.Map
	Data    interface{}
	Code    int
	ErrCode int
}

func (opt *Options) addDefaultValue() {
	if opt.Code < fiber.StatusContinue {
		opt.Code = fiber.StatusOK
	}
	if opt.Data == nil {
		opt.Data = fiber.Map{}
	}
}

type Error struct {
	Data    interface{} `json:"message"`
	Code    int         `json:"code"`
	ErrCode int         `json:"error_code"`
}

func (e *Error) Error() string {
	return fmt.Sprintf("%v", e.Data)
}

type ErrorOptions struct {
	Data    interface{}
	ErrCode int
}

type Service struct{}

func NewError(code int, opts ...ErrorOptions) *Error {
	e := &Error{Code: code, Data: utils.StatusMessage(code)}
	if len(opts) > 0 {
		opt := opts[0]
		if reflect.TypeOf(opt.Data) != nil {
			e.Data = opt.Data
		}
		e.ErrCode = opt.ErrCode
	}
	return e
}

func New(ctx *fiber.Ctx, opt Options) (err error) {
	opt.addDefaultValue()
	if fiber.StatusOK <= opt.Code && opt.Code < fiber.StatusMultipleChoices {
		if opt.Extra != nil {
			return ctx.Status(opt.Code).JSON(fiber.Map{
				"error_code":  opt.ErrCode,
				"status_code": opt.Code,
				"data":        opt.Data,
				"extra":       opt.Extra,
			})
		}
		return ctx.Status(opt.Code).JSON(fiber.Map{
			"error_code":  opt.ErrCode,
			"status_code": opt.Code,
			"data":        opt.Data,
		})
	}
	return ctx.Status(opt.Code).JSON(fiber.Map{
		"error_code":  opt.ErrCode,
		"status_code": opt.Code,
		"error":       opt.Data,
	})
}

func NewArrayWithPaginationSuccess(ctx *fiber.Ctx, data interface{}, pagination *request.Pagination) error {
	if pagination.Total != nil {
		return New(ctx, Options{Data: data, Extra: fiber.Map{"limit": pagination.Limit, "page": pagination.Page, "total": *pagination.Total}})
	}
	return New(ctx, Options{Data: data, Extra: fiber.Map{"limit": pagination.Limit, "page": pagination.Page}})
}

func NewArrayWithPaginationFailure(ctx *fiber.Ctx, pagination *request.Pagination) error {
	return New(ctx, Options{Data: []fiber.Map{}, Extra: fiber.Map{"limit": pagination.Limit, "page": pagination.Page, "total": pagination.Total}})
}

func NewArrayWithPagination(ctx *fiber.Ctx, data interface{}, pagination *request.Pagination) (err error) {
	switch reflect.TypeOf(data).Kind() {
	case reflect.Slice:
		if !reflect.ValueOf(data).IsNil() {
			return NewArrayWithPaginationSuccess(ctx, data, pagination)
		}
		fallthrough
	default:
		return NewArrayWithPaginationFailure(ctx, pagination)
	}
}

func FiberErrorHandler(ctx *fiber.Ctx, err error) error {
	if e := new(Error); errors.As(err, &e) {
		return New(ctx, Options{Code: e.Code, Data: e.Data, ErrCode: e.ErrCode})
	} else if ef := new(fiber.Error); errors.As(err, &ef) {
		return New(ctx, Options{Code: ef.Code, Data: ef.Message})
	} else {
		return New(ctx, Options{Code: fiber.StatusInternalServerError, Data: err.Error()})
	}
}

import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<T = any> {
  @ApiProperty({
    example: true,
    description: "Success status of the operation",
  })
  success: boolean;

  @ApiProperty({
    example: "Operation completed successfully",
    description: "Message describing the result of the operation",
  })
  message: string;

  @ApiProperty({
    description: "Data returned by the operation",
    required: false,
  })
  data?: T;

  @ApiProperty({
    example: 200,
    description: "HTTP status code",
  })
  statusCode: number;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "Timestamp of the response",
  })
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    statusCode: number = 200
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    message: string,
    data?: T,
    statusCode: number = 200
  ): ResponseDto<T> {
    return new ResponseDto<T>(true, message, data, statusCode);
  }

  static error(message: string, statusCode: number = 400): ResponseDto {
    return new ResponseDto(false, message, undefined, statusCode);
  }
}

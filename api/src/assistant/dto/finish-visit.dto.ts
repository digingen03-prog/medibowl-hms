import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class FinishVisitDto {
  @IsNotEmpty({ message: 'Consultation fee is required' })
  @IsNumber({}, { message: 'Consultation fee must be a number' })
  @Min(0, { message: 'Consultation fee cannot be negative' })
  consultationFee: number;

  @IsNotEmpty({ message: 'Amount received is required' })
  @IsNumber({}, { message: 'Amount received must be a number' })
  @Min(0, { message: 'Amount received cannot be negative' })
  amountReceived: number;

  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(PaymentMethod, { message: 'Payment method must be CASH, UPI, CARD, or OTHER' })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}


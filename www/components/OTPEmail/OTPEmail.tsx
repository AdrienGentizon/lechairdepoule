type Props = {
  subject: string;
  message: string;
};

export default function OTPEmail({ subject, message }: Props) {
  return (
    <div>
      <h1>{subject}</h1>
      <p>{message}</p>
    </div>
  );
}

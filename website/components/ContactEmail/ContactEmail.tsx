type Props = {
  subject: string;
  message: string;
  from: string;
};

export default function ContactEmail({ subject, message, from }: Props) {
  return (
    <div>
      <h1>{subject}</h1>
      <h2>
        Message de: <a href={`mailto:${from}`}>{from}</a>
      </h2>
      <h3>Contenu du message:</h3>
      <p>{message}</p>
    </div>
  );
}

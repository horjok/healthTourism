interface Props {
  params: { id: string };
}

export default function PackageDetailPage({ params }: Props) {
  return (
    <main>
      <h1>Paket Detayı: {params.id}</h1>
    </main>
  );
}

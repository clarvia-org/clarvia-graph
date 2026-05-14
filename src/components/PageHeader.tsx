type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wide text-moss">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted">{description}</p>
    </header>
  );
}

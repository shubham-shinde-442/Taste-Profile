interface InfoListCardProps {
  title: string;
  subtitle: string;
  items: string[];
  icon?: string;
  titleIcon?: string;
  className?: string;
  itemIconClassName?: string;
  dotCount?: number;
  activeDot?: number;
}

export function InfoListCard({
  title,
  subtitle,
  items,
  icon = "•",
  titleIcon,
  className,
  itemIconClassName,
  dotCount,
  activeDot = 1
}: InfoListCardProps): JSX.Element {
  return (
    <article className={`info-card ${className ?? ""}`.trim()}>
      <header>
        <h3>
          {titleIcon ? <span className="card-title-icon">{titleIcon}</span> : null}
          {title}
        </h3>
        <p>{subtitle}</p>
      </header>
      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span className={`info-item-badge ${itemIconClassName ?? ""}`.trim()}>{icon}</span>
            <span className="info-item-text">{item}</span>
          </li>
        ))}
      </ul>
      {dotCount && dotCount > 1 ? (
        <div className="card-page-dots" aria-hidden>
          {Array.from({ length: dotCount }, (_, index) => (
            <span key={index} className={index + 1 === activeDot ? "dot-active" : "dot-inactive"} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

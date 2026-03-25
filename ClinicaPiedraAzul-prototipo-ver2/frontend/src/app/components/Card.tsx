function Card({ children, title }: any) {
  return (
    <div className="card-custom">
      {title && <h4 className="card-title">{title}</h4>}
      {children}
    </div>
  );
}

export default Card;
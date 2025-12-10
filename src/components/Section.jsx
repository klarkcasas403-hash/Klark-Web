function Section({ id, title, children }) {
  return (
    <section id={id} className="section">
      <h2>{title}</h2>
      
      <p>{children}</p>
    </section>
  );
}

export default Section;


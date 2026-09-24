import { motion } from 'framer-motion';
import { useInView } from '../lib/hooks';

export default function SectionHeader({ label, title, description, light = false }) {
  const [ref, inView] = useInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="section-header"
    >
      {label && <span className="label">{label}</span>}
      <h2 className={light ? 'text-white' : 'gradient-text'}>{title}</h2>
      {description && <p>{description}</p>}
    </motion.div>
  );
}

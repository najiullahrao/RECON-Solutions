import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { projectsApi } from '../../api';
import { isApiError } from '../../types/api';
import type { Project } from '../../types/api';
import { projectDetailPath } from '../../constants/routes';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ProjectsGallerySection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    projectsApi
      .list()
      .then((res) => {
        if (cancelled) return;
        if (isApiError(res)) {
          setProjects([]);
          return;
        }
        // Limit to 6 projects for the gallery
        const projectList = Array.isArray(res.data) ? res.data.slice(0, 6) : [];
        setProjects(projectList);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="border-t border-[#1a1a1a]/10 bg-white py-16 md:py-24"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="projects-heading" className="font-sans text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl" style={{ letterSpacing: '-0.02em' }}>
            Projects
          </h2>
          <Link
            to={ROUTES.PROJECTS}
            className="text-sm font-semibold text-[#800000] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
          >
            View all projects →
          </Link>
        </motion.div>

        {loading ? (
          <div className="mt-10 flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#800000] border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-10 text-center py-12 text-[#1a1a1a]/60">
            <p>No projects available at the moment.</p>
          </div>
        ) : (
          <motion.div
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={item}>
                <Link
                  to={projectDetailPath(project.id)}
                  className="group relative block overflow-hidden rounded-sm border border-gray-200 bg-[#f9f9f9] transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#800000] focus-visible:ring-offset-2"
                >
                  {project.images && project.images.length > 0 ? (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-[#e5e5e5] transition-colors group-hover:bg-[#d4d4d4]">
                      <div className="flex h-full items-center justify-center text-[#1a1a1a]/40">
                        <span className="text-sm font-medium">Project image</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#1a1a1a]/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="font-sans text-lg font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                      {project.title}
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="font-sans font-bold text-[#1a1a1a] group-hover:text-[#800000]" style={{ letterSpacing: '-0.02em' }}>
                      {project.title}
                    </span>
                    {project.location && (
                      <p className="mt-1 text-sm text-[#1a1a1a]/60">{project.location}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

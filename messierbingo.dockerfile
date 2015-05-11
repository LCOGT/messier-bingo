################################################################################
#
# Runs the LCOGT Python Django Mezzanine webapp using nginx + uwsgi
#
# The decision to run both nginx and uwsgi in the same container was made because
# it avoids duplicating all of the Python code and static files in two containers.
# It is convenient to have the whole webapp logically grouped into the same container.
#
# You can choose to expose the nginx and uwsgi ports separately, or you can
# just default to using the nginx port only (recommended). There is no
# requirement to map all exposed container ports onto host ports.
#
# To run with nginx only:
# docker run -d -p 80:80 --name=messierbingo lcogtwebmaster/lcogt:messierbingo_release
#
# See the notes in the code below about NFS mounts.
#
################################################################################

FROM centos:centos7
MAINTAINER LCOGT <webmaster@lcogt.net>

# Install package repositories
RUN yum -y install epel-release

# Install packages and update base system
RUN yum -y install nginx python-pip mysql-devel python-devel supervisor 
RUN yum -y groupinstall "Development Tools"
RUN yum -y update

# Copy the LCOGT Mezzanine webapp files
COPY game /var/www/html

# Setup the Python Django environment
ENV BRANCH ${BRANCH}

# Copy configuration files
COPY docker/config/nginx.conf /etc/nginx/
COPY docker/config/messierbingo.ini /etc/supervisord.d/messierbingo.ini

# nginx (http protocol) runs on port 8100
EXPOSE 80

# Entry point is the supervisord daemon
ENTRYPOINT [ "/usr/bin/supervisord", "-n" ]

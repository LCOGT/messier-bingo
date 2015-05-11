################################################################################
#
# Messier Bingo Website
#
# To build and run this docker container:
# docker build -t lcogtwebmaster/lcogt:messierbingo_release .
# docker run -d -p 80:80 --name=messierbingo lcogtwebmaster/lcogt:messierbingo_release
#
################################################################################

FROM centos:centos7
MAINTAINER LCOGT <webmaster@lcogt.net>

# Install and update packages
RUN yum -y install epel-release \
        && yum -y install nginx supervisor \
        && yum -y update

# Copy configuration files
COPY docker/processes.ini /etc/supervisord.d/processes.ini
COPY docker/nginx/* /etc/nginx/

# nginx on port 80
EXPOSE 80

# Entry point is the supervisord daemon
ENTRYPOINT [ "/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf" ]

# Copy the webapp files
COPY game /var/www/html

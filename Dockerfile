################################################################################
#
# Runs the LCOGT Messier Bingo app using nginx + uwsgi
#

#
################################################################################

FROM centos:centos7
MAINTAINER Edward Gomez <egomez@lcogt.net>

# Install package repositories
RUN yum -y install epel-release \
	&& yum -y install nginx libjpeg-devel python-pip mysql-devel python-devel supervisor \
	&& yum -y groupinstall "Development Tools"\
	&& yum -y update

# Copy the LCOGT Mezzanine webapp files
COPY app/requirements.txt /var/www/apps/messierbingo/requirements.txt

RUN pip install pip==1.3 && pip install uwsgi==2.0.8 \
		&& pip install -r /var/www/apps/messierbingo/requirements.txt \

# Setup the Python Django environment
ENV PYTHONPATH /var/www/apps
ENV DJANGO_SETTINGS_MODULE messierbingo.settings

# Set the PREFIX env variable
ENV PREFIX /messierbingo

# Copy configuration files
COPY config/uwsgi.ini /etc/uwsgi.ini
COPY config/nginx/* /etc/nginx/
COPY config/processes.ini /etc/supervisord.d/processes.ini

# Listen to port 80
EXPOSE 80

# Entry point is the supervisord daemon
ENTRYPOINT [ "/init"]

# Copy configuration files
COPY config/init /init

# Copy the LCOGT Messier Bingo files
COPY app /var/www/apps/messierbingo

FROM centos:7
MAINTAINER Las Cumbres Observatory <webmaster@lco.global>

EXPOSE 80
ENTRYPOINT [ "/init" ]

# Setup the Python Django environment
ENV PYTHONPATH /var/www/apps
ENV DJANGO_SETTINGS_MODULE messierbingo.settings

# Install package repositories
RUN yum -y install epel-release \
	&& yum -y install nginx libjpeg-devel python-pip mysql-devel python-devel supervisor \
	&& yum -y install libxslt-devel libxml2-devel \
	&& yum -y groupinstall "Development Tools"\
	&& yum -y update

# Copy the LCOGT Mezzanine webapp files
COPY app/requirements.txt /var/www/apps/messierbingo/requirements.txt

RUN pip install pip==1.3 && pip install uwsgi==2.0.8 \
		&& pip install -r /var/www/apps/messierbingo/requirements.txt

# Copy operating system configuration files
COPY docker/ /

# Copy the LCOGT Messier Bingo files
COPY app /var/www/apps/messierbingo

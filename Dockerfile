FROM python:3.6-alpine
MAINTAINER LCOGT <webmaster@lcogt.net>

EXPOSE 80

ENV PYTHONUNBUFFERED 1
ENV C_FORCE_ROOT true

# install depedencies
COPY app/requirements.txt /var/www/apps/messierbingo/
RUN apk --no-cache add mariadb-connector-c \
        && apk --no-cache add --virtual .build-deps gcc git mariadb-dev musl-dev libxml2 \
        && pip --no-cache-dir --trusted-host=buildsba.lco.gtn install -r /var/www/apps/messierbingo/requirements.txt \
        && apk --no-cache del .build-deps

# install entrypoint
COPY docker/ /

# Ensure crond will run on all host operating systems
RUN crontab /crontab.root \
    && rm -rf /crontab.root

# install web application
COPY app /var/www/apps/messierbingo/
ENTRYPOINT [ "/init" ]

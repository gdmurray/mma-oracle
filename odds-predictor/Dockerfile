FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Make port 5555 available to the world outside this container
EXPOSE 5555

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5555", "app:app"]

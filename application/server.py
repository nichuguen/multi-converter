# -*- coding: utf-8 -*-

from converter import app
import os

def main():
    debug = os.environ["DEBUG"] == "True"
    app.run(debug=debug, host="0.0.0.0")


if __name__ == "__main__":
    main()

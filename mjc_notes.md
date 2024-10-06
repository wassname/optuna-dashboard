# https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating
```sh
nvm install 16
nvm use 16

# in one terminal
cd optuna_dashboard/
npm i
npm run watch


# npm install -g wasm-pack
# sudo apt install rustup
# rustup default stable
# make serve-browser-app

# in another terminal python
python3 -m venv .venv --prompt optunadashboard
. ./.venv/bin/activate
pip install -e .
OPTUNA_DASHBOARD_DEBUG=1 optuna-dashboard sqlite:///optuna3.db --port=8089
```
